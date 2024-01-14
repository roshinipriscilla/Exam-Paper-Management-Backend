const deptModel = require("../models/department");

exports.getAllDepartments = async (req, res) => {
  try {
    deptModel.find().then((data) => {
      if (data.length) {
        res.status(200).json({ status: "success", data: data });
      } else {
        res
          .status(400)
          .json({ status: "failed", error: "NO DEPARTMENT AVAILABLE" });
      }
    });
  } catch (error) {
    res.status(500).json({ status: "Failed", error });
  }
};

exports.addDepartment = async (req, res) => {
  try {
    const { department, course } = req.body;
    if (department && course) {
      deptModel
        .find({ department: department })
        .then(async (data) => {
          console.log(data);
          if (data.length) {
            res
              .status(400)
              .json({ status: "failed", error: "DEPARMENT ALREADY EXISTS" });
          } else {
            const dept = new deptModel({
              department: department,
              courses: course,
            });
            await dept
              .save()
              .then((data) => {
                res.status(200).json({ status: 200, data: data });
              })
              .catch((error) => {
                res.status(400).json({ status: "failed", error });
              });
          }
        })
        .catch((error) => {
          res.status(400).json({ status: "failed", error });
        });
    } else {
      res.status(400).json({ status: "failed", error: "Missing fields" });
    }
  } catch (error) {
    res.status(500).json({ status: "Failed", error });
  }
};
