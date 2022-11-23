const router = require('express').Router();

router.use('/auth',require("./auth"));
router.use('/user',require("./user"));
router.use('/recipe',require("./recipe"));
router.use('/admin',require("./admin"));
router.use('/album',require("./album"));
router.use('/wish',require("./wish"));
router.use('/like',require("./like"));
router.use('/kahani',require("./kahani"));
router.use('/alarm',require("./alarm"));
router.use('/family',require("./family"));
router.use('/friend',require("./friend"));
router.use('/twilio',require("./twilio"));
router.use('/notification',require("./notification"));

module.exports = router;
