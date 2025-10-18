// backend/routes/emailsandbox.js
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

// Use your Stripe secret key (sandbox)
const stripe = new Stripe("sk_test_51RL7bvQjCxIUnFiQOrPE5eY09IT3AnJEgGwfIskXdg8ipkf6SVPyTuCtHawYWfu7jkobdHj8Xkw03xLSVNu2dhxf00ylFOJL4X");

router.post("/send-receipt", async (req, res) => {
  const { email, name, amount } = req.body;

  try {
    // Create a PaymentIntent (Stripe will send sandbox receipt automatically)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 1999, // in cents, default $19.99
      currency: "usd",
      payment_method_types: ["card"],
      receipt_email: email,
      description: `Sandbox receipt for ${name || "Customer"}`,
    });

    res.json({
      success: true,
      message: "PaymentIntent created, sandbox receipt will be sent.",
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Error creating PaymentIntent:", err);
    // Still respond success false but do not block frontend redirect
    res.status(500).json({
      success: false,
      message: "Failed to create PaymentIntent (sandbox email not sent).",
      error: err.message,
    });
  }
});

module.exports = router;
