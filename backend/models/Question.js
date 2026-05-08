const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: [arr => arr.length === 4, 'Must have exactly 4 options']
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  subject: {
    type: String,
    required: true,
    enum: [
      'Operating Systems',
      'DBMS',
      'Computer Networks',
      'Algorithms',
      'Data Structures',
      'Theory of Computation',
      'Compiler Design',
      'Computer Organization',
      'Digital Logic',
      'Engineering Mathematics',
      'General Aptitude'
    ]
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  explanation: {
    type: String,
    default: ''
  },
  isBossQuestion: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Indexes for fast querying
questionSchema.index({ subject: 1, difficulty: 1 });
questionSchema.index({ isBossQuestion: 1 });

module.exports = mongoose.model('Question', questionSchema);
