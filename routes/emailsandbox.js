/**
 * @swagger
 * tags:
 *   - name: EmailSandbox
 *     description: Send sandbox receipt emails via Stripe
 */

/**
 * @swagger
 * /api/email-sandbox/send-receipt:
 *   post:
 *     summary: Send a Stripe sandbox receipt email
 *     tags: [EmailSandbox]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 description: Customer email
 *               name:
 *                 type: string
 *                 description: Customer name
 *               amount:
 *                 type: integer
 *                 description: Amount in cents (default 1999)
 *     responses:
 *       200:
 *         description: PaymentIntent created and sandbox receipt sent
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
 *       500:
 *         description: Failed to create PaymentIntent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

// Use your Stripe secret key (sandbox)
const stripe = new Stripe(
  "sk_test_51RL7bvQjCxIUnFiQOrPE5eY09IT3AnJEgGwfIskXdg8ipkf6SVPyTuCtHawYWfu7jkobdHj8Xkw03xLSVNu2dhxf00ylFOJL4X"
);

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
