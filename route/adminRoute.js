const Router = require("express");
const adminController = require("../controller/adminController");

const router = Router();

router.post("/staff", adminController.regPost);
router.post("/team", adminController.teamPost);
router.post("/working-hours", adminController.patchWorkingHours);
router.post("/business", adminController.saveOrUpdateBusiness);
router.post("/login", adminController.login);

router.get("/staff", adminController.staffGet);
router.get("/working-hours", adminController.getWorkingHours);
router.get("/team", adminController.teamGet);
router.get("/business", adminController.businessGet);
router.get("/attendances", adminController.getAttendances);
router.get("/attendance/:id", adminController.getAttendance);
router.get("/payrolls/", adminController.getAllPayroll);
router.get("/payroll/:id", adminController.getSinglePayroll);

router.post("/payroll/:id", adminController.postPayrollDetails);


module.exports = router;