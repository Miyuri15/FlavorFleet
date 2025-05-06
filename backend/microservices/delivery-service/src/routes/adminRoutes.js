const { admin } = require("../middlewares/auth");

router.get("/", admin, getAllDeliveries);
