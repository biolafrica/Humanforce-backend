const Router = require("express");
const userController = require("../controller/userController");

const router = Router();
router.post("/login", userController.login);

router.post("/clock", userController.postClock);
router.post("/clocked", userController.postClocked);
router.patch("/clock/:id", userController.patchClock);
router.get("/clock/:id", userController.getClock);

router.get("/attendance/", userController.getAttendance);

router.get("/business", userController.fetchBusiness);

router.get("/working-hours", userController.fetchWorkingHours);

router.get("/payslip/", userController.getUserPayslip);


module.exports = router;