import StudyGroup from '../models/StudyGroup.js';

export const getAllGroups = async (req, res) => {
  try {
    const { search, course, faculty } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { courseName: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } }
      ];
    }

    if (course) {
      query.courseName = { $regex: course, $options: 'i' };
    }

    if (faculty) {
      query.faculty = faculty;
    }

    const groups = await StudyGroup.find(query)
      .populate('leader', 'name email program')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.json({ groups });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate('leader', 'name email program yearOfStudy')
      .populate('members', 'name email program yearOfStudy');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json({ group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { name, courseName, courseCode, description, meetingLocation, faculty } = req.body;

    const group = await StudyGroup.create({
      name,
      courseName,
      courseCode,
      description,
      meetingLocation,
      faculty,
      leader: req.user._id,
      members: [req.user._id]
    });

    const populatedGroup = await StudyGroup.findById(group._id)
      .populate('leader', 'name email program')
      .populate('members', 'name email');

    res.status(201).json({ group: populatedGroup });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only group leader can update this group' });
    }

    const updatedGroup = await StudyGroup.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('leader', 'name email program').populate('members', 'name email');

    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only group leader can delete this group' });
    }

    await group.deleteOne();
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    group.members.push(req.user._id);
    await group.save();

    const updatedGroup = await StudyGroup.findById(req.params.id)
      .populate('leader', 'name email program')
      .populate('members', 'name email');

    res.json({ group: updatedGroup });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.leader.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Group leader cannot leave the group. Transfer leadership or delete the group instead.' });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }

    group.members = group.members.filter(member => member.toString() !== req.user._id.toString());
    await group.save();

    res.json({ message: 'Successfully left the group' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only group leader can remove members' });
    }

    const { memberId } = req.params;
    if (group.leader.toString() === memberId) {
      return res.status(400).json({ message: 'Cannot remove group leader' });
    }

    group.members = group.members.filter(member => member.toString() !== memberId);
    await group.save();

    const updatedGroup = await StudyGroup.findById(req.params.groupId)
      .populate('leader', 'name email program')
      .populate('members', 'name email');

    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const groups = await StudyGroup.find({
      $or: [
        { leader: req.user._id },
        { members: req.user._id }
      ]
    })
      .populate('leader', 'name email program')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};