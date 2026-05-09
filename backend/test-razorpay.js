require('dotenv').config();
const { createOrder } = require('./services/paymentService');

async function test() {
    try {
        const order = await createOrder(14.0, "1234");
        console.log("Order created:", order.id);
    } catch (err) {
        console.error("Error creating order:", err.message || err.error?.description);
    }
}
test();
