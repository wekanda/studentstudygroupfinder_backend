import StudySession from '../models/StudySession.js';
import StudyGroup from '../models/StudyGroup.js';

export const getGroupSessions = async (req, res) => {
  try {
    const sessions = await StudySession.find({ groupId: req.params.groupId })
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSession = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only group leader can create sessions' });
    }

    const session = await StudySession.create({
      ...req.body,
      groupId: req.params.groupId,
      createdBy: req.user._id
    });

    const populatedSession = await StudySession.findById(session._id)
      .populate('createdBy', 'name email');

    res.status(201).json(populatedSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const group = await StudyGroup.findById(session.groupId);

    if (session.createdBy.toString() !== req.user._id.toString() && 
        group.leader.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this session' });
    }

    await session.deleteOne();
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMySessions = async (req, res) => {
  try {
    const groups = await StudyGroup.find({
      $or: [
        { leader: req.user._id },
        { members: req.user._id }
      ]
    });

    const groupIds = groups.map(g => g._id);

    const sessions = await StudySession.find({
      groupId: { $in: groupIds },
      date: { $gte: new Date() }
    })
      .populate('groupId', 'name courseName courseCode')
      .populate('createdBy', 'name')
      .sort({ date: 1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};