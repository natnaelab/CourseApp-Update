const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  minAge: { 
    type: Number, 
    required: true 
  },
  maxAge:{
    type:Number,
    required:true,
  },
  bilingual: { 
    type: String, 
    required: true
  },
  level: { 
    type: String, 
    required: false 
  },
  online_in_person: { 
    type: String, 
    required: true, 
    enum: ["Online", "In-Person"] 
  },
  group_private: { 
    type: String, 
    required: true, 
    enum: ["Group", "Private"] 
  },
  day: { 
    type: String, 
    required: true 
  },
  time: { 
    type: String,
    required: true 
  },
  duration: { 
    type: String, 
    required: true 
  },
  course_title: { 
    type: String, 
    required: true 
  },
  short_description: { 
    type: String, 
  },
  notes: { 
    type: String, 
  },
  image_link: { 
    type: String, 
    required: true 
  },
  link: { 
    type: String, 
    required: true 
  },
  group_name: { 
    type: String, 
    required: true 
  },
  teacher: { 
    type: [String], 
    required: true 
  },
  zoom_link: { 
    type: String, 
    required: false 
  },
  location: { 
    type: String, 
    required: false 
  },
  exam: { 
    type: String, 
    required: false 
  },
  max_students: { 
    type: Number, 
    required: false 
  },
  cost: { 
    type: Number, 
    required: false 
  },
  frequency: { 
    type: String, 
    required: false 
  },
  course_book: { 
    type: String, 
    required: false 
  }
}, { timestamps: true });

module.exports = mongoose.model("Course", CourseSchema);
