const Router = require("express");
const adminController = require("../controller/adminController");

const router = Router();

router.post("/staff", adminController.regPost);
router.get("/staff", adminController.staffGet);
router.post("/staff/:id", adminController.postUser);
router.get("/staff/:id", adminController.getSelectedUser);

router.post("/team", adminController.teamPost);
router.get("/team", adminController.teamGet);
router.get("/team/:id", adminController.getSelectedTeam);
router.post("/team-edit/:id", adminController.teamEdit);
router.delete("/team-delete/:id", adminController.teamDelete);

router.post("/business", adminController.saveOrUpdateBusiness);
router.get("/business", adminController.businessGet);

router.get("/attendances", adminController.getAttendances);
router.get("/attendance/:id", adminController.getAttendance);

router.get("/payrolls/", adminController.getAllPayroll);
router.get("/payroll/:id", adminController.getSinglePayroll);
router.post("/payroll/:id", adminController.postPayrollDetails);

router.post("/working-hours", adminController.patchWorkingHours);
router.get("/working-hours", adminController.getWorkingHours);

router.post("/login", adminController.login);



module.exports = router;