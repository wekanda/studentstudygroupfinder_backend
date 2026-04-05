import User from '../models/User.js';
import StudyGroup from '../models/StudyGroup.js';
import StudySession from '../models/StudySession.js';

export const getStudentDashboard = async (req, res) => {
  try {
    const myGroups = await StudyGroup.find({
      $or: [
        { leader: req.user._id },
        { members: req.user._id }
      ]
    }).populate('leader', 'name').populate('members', 'name');

    const groupIds = myGroups.map(g => g._id);

    const upcomingSessions = await StudySession.find({
      groupId: { $in: groupIds },
      date: { $gte: new Date() }
    })
      .populate('groupId', 'name courseName')
      .sort({ date: 1 })
      .limit(5);

    const recentGroups = await StudyGroup.find()
      .populate('leader', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      myGroups,
      upcomingSessions,
      recentGroups
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGroups = await StudyGroup.countDocuments();
    
    const groupsByFaculty = await StudyGroup.aggregate([
      {
        $group: {
          _id: '$faculty',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const activeCourses = await StudyGroup.aggregate([
      {
        $group: {
          _id: '$courseName',
          count: { $sum: 1 },
          groups: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const recentGroups = await StudyGroup.find()
      .populate('leader', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalUsers,
      totalGroups,
      groupsByFaculty,
      topCourses: activeCourses.map(c => ({ name: c._id, count: c.count })),
      recentGroups
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};