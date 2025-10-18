/**
 * @file emailsandbox.js
 * @description Sends sandbox PaymentIntent receipts using Stripe.
 */

const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

// Stripe secret key (sandbox)
const stripe = new Stripe(
  "sk_test_51RL7bvQjCxIUnFiQOrPE5eY09IT3AnJEgGwfIskXdg8ipkf6SVPyTuCtHawYWfu7jkobdHj8Xkw03xLSVNu2dhxf00ylFOJL4X"
);

/**
 * @swagger
 * /api/email-sandbox/send-receipt:
 *   post:
 *     summary: Send a sandbox receipt email via Stripe
 *     tags: [EmailSandbox]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: manuelthabisomapoulo@gmail.com
 *               name:
 *                 type: string
 *                 example: Thabiso Mapoulo
 *               amount:
 *                 type: integer
 *                 example: 1999
 *     responses:
 *       200:
 *         description: Sandbox PaymentIntent created and email attempted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 clientSecret:
 *                   type: string
 */
router.post("/send-receipt", async (req, res) => {
  const { email, name, amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 1999,
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
    res.status(500).json({
      success: false,
      message: "Failed to create PaymentIntent (sandbox email not sent).",
      error: err.message,
    });
  }
});

module.exports = router;
