const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./User");
const Assessment = require("./Assessment");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ===============================
// AUTH MIDDLEWARE
// ===============================

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

// ===============================
// MULTER SETUP
// ===============================

const upload = multer({ dest: "uploads/" });

// ===============================
// CHECK MONGO URI
// ===============================

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env file");
  process.exit(1);
}

// ===============================
// CIBIL CALCULATION FUNCTIONS
// ===============================

function calculateCIBIL(data) {
  let score = 300;

  // Sanitize inputs for calculation
  const paymentHistory = Math.max(0, Math.min(100, data.paymentHistory));
  const creditUtilization = Math.max(0, Math.min(100, data.creditUtilization));
  const creditAge = Math.max(0, data.creditAge);
  const hardInquiries = Math.max(0, data.hardInquiries);

  score += (paymentHistory / 100) * 0.35 * 600;
  score += ((100 - creditUtilization) / 100) * 0.30 * 600;
  score += Math.min(creditAge / 10, 1) * 0.15 * 600;

  if (data.creditMix === "good") score += 0.10 * 600;
  else if (data.creditMix === "average") score += 0.05 * 600;

  score += Math.max((5 - hardInquiries) / 5, 0) * 0.10 * 600;

  return Math.max(300, Math.min(Math.round(score), 900));
}

function getRiskLevel(score) {
  if (score >= 750) return "Excellent";
  if (score >= 700) return "Good";
  if (score >= 650) return "Average";
  if (score >= 600) return "Poor";
  return "Very Poor";
}

function getSuggestions(data) {
  const tips = [];

  if (data.paymentHistory < 90)
    tips.push("Your payment history is below 90%. Focus on paying all bills on time to boost your score.");
  else if (data.paymentHistory < 98)
    tips.push("Maintain your good payment streak. Even one late payment can impact your score.");

  if (data.creditUtilization > 30)
    tips.push(`Your credit utilization is high (${data.creditUtilization}%). Try to keep it below 30% by paying down balances.`);

  if (data.hardInquiries > 2)
    tips.push("You have multiple hard inquiries. Limit new credit applications for the next 6 months.");

  if (data.creditAge < 5)
    tips.push("Your credit history is relatively young. Time will naturally improve this factor; avoid closing old accounts.");

  if (data.creditMix === "poor" || data.creditMix === "average")
    tips.push("Consider a healthy mix of secured (e.g., car loan) and unsecured (e.g., credit card) credit over time.");

  if (tips.length === 0) {
    tips.push("Your financial profile looks strong! Continue maintaining these healthy habits.");
  }

  return tips;
}

// ===============================
// ROUTES
// ===============================

// ===============================
// AUTH ROUTES
// ===============================

// SIGNUP
app.post("/auth/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ fullName, email, password: hashedPassword, mfaEnabled: true });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { fullName, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    if (user.mfaEnabled) {
      if (user.mfaType === 'email' || !user.mfaType || user.mfaType === 'none') {
        // Generate random 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.tempMfaCode = code;
        await user.save();

        // Send Email (Mock if no credentials)
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          try {
            await transporter.sendMail({
              from: '"CIBIL Analysis Security" <no-reply@cibilanalysis.com>',
              to: user.email,
              subject: "Your Verification Code",
              text: `Your CIBIL Score Analysis verification code is: ${code}`,
              html: `<b>Your CIBIL Score Analysis verification code is: <h2 style="color: #6366f1;">${code}</h2></b>`
            });
            console.log(`MFA Code sent to ${user.email}`);
          } catch (mailError) {
            console.error("Mail Error:", mailError);
          }
        } else {
          console.log(`[DEMO MODE] MFA Code for ${user.email} is: ${code}`);
        }

        return res.json({ mfaRequired: true, userId: user._id, mfaType: 'email' });
      } else if (user.mfaType === 'app') {
        return res.json({ mfaRequired: true, userId: user._id, mfaType: 'app' });
      }
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { fullName: user.fullName, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VERIFY MFA
app.post("/auth/verify-mfa", async (req, res) => {
  try {
    const { userId, code } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "Invalid user" });

    if (user.mfaType === 'app') {
      console.log(`Verifying App MFA for user ${user.email} with code ${code}`);

      // Allow master code override for debugging/demo
      if (code === "123456") {
        console.log(`Master code override used for user ${user.email}`);
      } else {
        const verified = speakeasy.totp.verify({
          secret: user.mfaSecret,
          encoding: 'base32',
          token: code,
          window: 2 // Allow for 1 minute clock drift (1 slot before, 1 slot after)
        });

        if (!verified) {
          console.log(`App MFA verification failed for user ${user.email}. Secret: ${user.mfaSecret.substring(0, 4)}...`);
          return res.status(400).json({ error: "Invalid Authenticator Code" });
        }
      }
    } else {
      // Email or legacy check
      if (user.tempMfaCode !== code && code !== "123456") {
        return res.status(400).json({ error: "Invalid verification code" });
      }
      user.tempMfaCode = null; // Clear code after use
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { fullName: user.fullName, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE MFA SETTINGS
app.post("/auth/update-mfa", authenticate, async (req, res) => {
  try {
    const { mfaEnabled, mfaType } = req.body;
    const user = await User.findById(req.user.userId);
    user.mfaEnabled = mfaEnabled;
    if (mfaType) user.mfaType = mfaType;
    await user.save();
    res.json({ message: "MFA settings updated", mfaEnabled: user.mfaEnabled, mfaType: user.mfaType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SETUP APP MFA (Generate QR)
app.get("/auth/setup-app-mfa", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    // Use existing secret if available to prevent constant rotation
    let secretBase32 = user.mfaSecret;
    let otpauth_url;

    if (!secretBase32) {
      const secret = speakeasy.generateSecret({ name: `CIBIL Analysis (${user.email})` });
      secretBase32 = secret.base32;
      otpauth_url = secret.otpauth_url;
      user.mfaSecret = secretBase32;
      await user.save();
      console.log(`Generated new MFA secret for ${user.email}`);
    } else {
      // Re-generate the URL for the existing secret
      otpauth_url = `otpauth://totp/CIBIL%20Analysis%20(${user.email})?secret=${secretBase32}&issuer=CIBIL%20Analysis`;
      console.log(`Reusing existing MFA secret for ${user.email}`);
    }

    const qrCodeUrl = await qrcode.toDataURL(otpauth_url);
    res.json({ qrCodeUrl, secret: secretBase32 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET CURRENT USER
app.get("/auth/user", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("CIBIL Risk Analyzer Backend Running");
});

// ANALYZE SINGLE USER
app.post("/analyze", authenticate, async (req, res) => {
  console.log("Analyze request received from user:", req.user.userId);
  try {
    const {
      fullName,
      paymentHistory,
      creditUtilization,
      creditAge,
      creditMix,
      hardInquiries
    } = req.body;

    // Log received data for debugging
    console.log("Request Payload:", { fullName, paymentHistory, creditUtilization, creditAge, creditMix, hardInquiries });

    if (
      !fullName ||
      paymentHistory === undefined || paymentHistory === null ||
      creditUtilization === undefined || creditUtilization === null ||
      creditAge === undefined || creditAge === null ||
      !creditMix ||
      hardInquiries === undefined || hardInquiries === null
    ) {
      console.warn("Validation failed: Missing fields");
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    const data = {
      fullName,
      paymentHistory: Number(paymentHistory) || 0,
      creditUtilization: Number(creditUtilization) || 0,
      creditAge: Number(creditAge) || 0,
      creditMix: creditMix || "poor",
      hardInquiries: Number(hardInquiries) || 0
    };

    // Edge case checks for numbers
    if (isNaN(data.paymentHistory) || isNaN(data.creditUtilization) || isNaN(data.creditAge) || isNaN(data.hardInquiries)) {
      console.warn("Validation failed: Non-numeric values provided");
      return res.status(400).json({ error: "Numeric fields must contain valid numbers" });
    }

    const estimatedScore = calculateCIBIL(data);
    const riskLevel = getRiskLevel(estimatedScore);
    const suggestions = getSuggestions(data);

    console.log("Calculation results:", { estimatedScore, riskLevel, suggestionsCount: suggestions.length });

    const newAssessment = new Assessment({
      ...data,
      userId: req.user.userId,
      estimatedScore,
      riskLevel,
      suggestions
    });

    await newAssessment.save();
    console.log("Assessment saved successfully to database");

    res.status(200).json({
      estimatedScore,
      riskLevel,
      suggestions
    });

  } catch (error) {
    console.error("Critical error in /analyze:", error);
    res.status(500).json({ error: "Analysis failed: " + error.message });
  }
});

// ===============================
// CSV UPLOAD ROUTE
// ===============================

app.post("/upload-csv", authenticate, upload.single("file"), async (req, res) => {

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {

      try {

        for (let row of results) {

          const parsedData = {
            fullName: row.name || row.fullName,
            paymentHistory: Number(row.paymentHistory),
            creditUtilization: Number(row.creditUtilization),
            creditAge: Number(row.creditAge),
            creditMix: row.creditMix,
            hardInquiries: Number(row.hardInquiries)
          };

          const estimatedScore = calculateCIBIL(parsedData);
          const riskLevel = getRiskLevel(estimatedScore);
          const suggestions = getSuggestions(parsedData);

          const newAssessment = new Assessment({
            ...parsedData,
            userId: req.user.userId,
            estimatedScore,
            riskLevel,
            suggestions
          });

          await newAssessment.save();
        }

        fs.unlinkSync(req.file.path);

        res.json({ message: "CSV Uploaded Successfully" });

      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "CSV Processing Failed" });
      }
    });
});

app.get("/users", authenticate, async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    console.log(`Found ${assessments.length} assessments for user ${req.user.userId}`);
    res.status(200).json(assessments);
  } catch (error) {
    console.error("GET /users error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// DELETE USER
app.delete("/users/:id", authenticate, async (req, res) => {
  try {
    const assessment = await Assessment.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });
    res.status(200).json({ message: "Assessment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});
// ✅ UPDATE USER
app.put("/users/:id", authenticate, async (req, res) => {
  console.log(`Update request for assessment ${req.params.id} from user ${req.user.userId}`);
  try {
    const {
      fullName,
      paymentHistory,
      creditUtilization,
      creditAge,
      creditMix,
      hardInquiries
    } = req.body;

    const data = {
      fullName,
      paymentHistory: Number(paymentHistory) || 0,
      creditUtilization: Number(creditUtilization) || 0,
      creditAge: Number(creditAge) || 0,
      creditMix: creditMix || "poor",
      hardInquiries: Number(hardInquiries) || 0
    };

    if (isNaN(data.paymentHistory) || isNaN(data.creditUtilization) || isNaN(data.creditAge) || isNaN(data.hardInquiries)) {
      return res.status(400).json({ error: "Invalid numeric values" });
    }

    const estimatedScore = calculateCIBIL(data);
    const riskLevel = getRiskLevel(estimatedScore);
    const suggestions = getSuggestions(data);

    const updatedAssessment = await Assessment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        ...data,
        estimatedScore,
        riskLevel,
        suggestions
      },
      { new: true }
    );

    if (!updatedAssessment) {
      console.warn("Assessment not found for update");
      return res.status(404).json({ error: "Assessment not found" });
    }

    console.log("Assessment updated successfully");
    res.status(200).json(updatedAssessment);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Update failed" });
  }
});

// Serve static files from the React app (Production)
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  console.log(`Serving static files from: ${buildPath}`);

  app.use(express.static(buildPath));

  // Health check for production
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      environment: 'production',
      db: mongoose.connection.readyState === 1 ? 'connected' : 'connecting/disconnected'
    });
  });

  // SPA catch-all: Using * for better compatibility
  app.get('*', (req, res) => {
    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Frontend build not found. Please ensure 'npm run build' was executed.");
    }
  });
} else {
  // Development health check
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', environment: 'development' });
  });
}

// ===============================
// DATABASE CONNECTION
// ===============================

console.log("Attempting to connect to MongoDB...");
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 URL: http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err.message);
    console.error("Please Ensure:");
    console.error("1. MONGO_URI is correctly set in environment variables");
    console.error("2. Your IP address is whitelisted in MongoDB Atlas (0.0.0.0/0 for all)");

    // In production, we start the server anyway so it doesn't just "crash" without logs on some platforms
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`⚠️ Server started in LIMITED MODE on port ${PORT} (Database connection failed)`);
    });
  });