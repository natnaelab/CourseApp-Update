const router = require("express").Router();
const Course = require("../Models/Course");
const Verify = require("../authMiddleware"); // Keep authentication for protected routes

router.get("/", async (req, res) => {
  try {
    const {
      ageRange,
      onlineInPerson,
      groupPrivate,
      day,
      startTime,
      endTime,
      bilingual,
      level,
      location,
      sortBy,
      sortOrder = "asc",
      page = 1,
      limit = 1000,
    } = req.query;

    const filters = {};

    if (ageRange) {
      const ages = ageRange.split("-").map(Number);
      let filterMin, filterMax;

      if (ages.length === 1) {
        filterMin = ages[0];
        filterMax = Infinity;
      } else {
        [filterMin, filterMax] = ages;
      }


      filters.$or = [
        {
          minAge: { $lte: filterMax },
          maxAge: { $gt: filterMin }
        }
      ];
    }

    if (onlineInPerson && onlineInPerson !== "Don't Mind") {
      filters.online_in_person = {
        $regex: new RegExp(`^${onlineInPerson.trim()}$`, "i"),
      };
    }

    if (groupPrivate && groupPrivate !== "Don't Mind") {
      filters.group_private = groupPrivate;
    }

    if (day && day !== "Don't Mind") {
      filters.day = { $regex: new RegExp(`^${day.trim()}$`, "i") };
    }

    if (startTime && endTime) {
      filters.time = { $gte: startTime, $lte: endTime };
    }

    if (bilingual && bilingual !== "Don't Mind") {
      filters.bilingual = { $regex: new RegExp(`^${bilingual.trim()}$`, "i") };
    }

    if (level && level !== "Don't Mind") {
      filters.level = { $regex: new RegExp(`^${level.trim()}$`, "i") };
    }

    if (
      location &&
      location !== "Don't Mind" &&
      onlineInPerson === "In-Person"
    ) {
      filters.location = { $regex: new RegExp(`^${location.trim()}$`, "i") };
    } else if (onlineInPerson === "In-Person") {
      delete filters.location;
    }

    const sortQuery = {};
    if (sortBy === "cost") {
      sortQuery.cost = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "Duration") {
      sortQuery.duration = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "Dates") {
      sortQuery.day = sortOrder === "asc" ? 1 : -1;
    }

    console.log("Applied Filters:", filters);

    const courses = await Course.find(filters)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1, ...sortQuery });

    const totalCourses = await Course.countDocuments(filters);
    const totalPages = Math.ceil(totalCourses / limit);

    const timestamp = new Date().toISOString();

    res.json({
      timestamp,
      courses,
      totalPages,
      totalCourses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/save", Verify, async (req, res) => {
  try {
    const courses = req.body;

    if (!Array.isArray(courses) || courses.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid data. Please provide an array of courses." });
    }

    // Remove all existing courses
    await Course.deleteMany({});

    // Insert the new courses from the Excel file
    const savedCourses = await Course.insertMany(courses);

    res.status(200).json({
      message: `Replaced courses with ${savedCourses.length} new courses successfully`,
    });
  } catch (err) {
    console.error("Error saving courses:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/createCourse", Verify, async (req, res) => {
  try {
    const newCourse = new Course(req.body)
    await newCourse.save()
    res.status(200).json({
      message: `Course Created Successfully`,
    });
  } catch (err) {
    console.error("Error creating course:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: "Validation Error",
        errors: err.errors
      });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
})


router.post("/duplicateCourse", Verify, async (req, res) => {
  try {
    let { course_title, createdAt, updatedAt, __v, _id, ...otherFields } = req.body;
    let newTitle = course_title;


    const baseTitle = course_title.replace(/\s\(\d+\)$/, "");

    const existingCourses = await Course.find({
      course_title: new RegExp(`^${baseTitle} \\(\\d+\\)$`, "i"),
    });


    if (existingCourses.length > 0) {
      const highestNumber = Math.max(
        ...existingCourses.map((course) => {
          const match = course.course_title.match(/\((\d+)\)$/);
          return match ? parseInt(match[1], 10) : 0;
        }),
        0
      );
      newTitle = `${baseTitle} (${highestNumber + 1})`;
    } else {
      newTitle = `${baseTitle} (1)`;
    }

    const newCourse = new Course({ course_title: newTitle, ...otherFields });
    await newCourse.save();

    res.status(200).json({
      message: "Course Duplicated Successfully",
    });
  } catch (err) {
    console.error("Error duplicating course:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// 🔒 Protected: Delete courses (Requires login)
router.delete("/:id", Verify, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.status(200).json("Deleted Successfully");
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Public: Get unique course locations
router.get("/getLocations", async (req, res) => {
  try {
    const locations = await Course.distinct("location", {
      online_in_person: "In-Person",
    });
    return res.status(200).json(locations);
  } catch (err) {
    console.error("Error fetching locations:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/getCourseTypes", async (req, res) => {
  try {
    const groups = await Course.distinct("group_name")
    return res.status(200).json(groups);
  } catch (err) {
    console.error("Error fetching Group Types:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Public: Get all courses
router.get("/getAllCourse", async (req, res) => {
  try {
    const courses = await Course.find({});
    return res.status(200).json(courses);
  } catch (err) {
    console.error("Error fetching all courses:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found", status: false });
    } else {
      return res.status(200).json(course);
    }
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/:id", Verify, async (req, res) => {
  try {
    const courseUpdate = await Course.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    if (!courseUpdate) {
      return res
        .status(404)
        .json({ message: "Course not Found", status: false });
    }

    return res
      .status(200)
      .json({ message: "Course Updated Successfully", status: false });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
