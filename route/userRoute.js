const Router = require("express");
const userController = require("../controller/userController");

const router = Router();
router.post("/login", userController.login);
router.post("/clock", userController.postClock);
router.post("/clocked", userController.postClocked);
router.patch("/clock/:id", userController.patchClock);
router.get("/clock/:id", userController.getClock);



module.exports = router;