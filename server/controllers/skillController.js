import Skill from '../models/Skill.js';

export const getSkills = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skills = await Skill.find(filter).sort({ popularityCount: -1, name: 1 });
    res.json({ success: true, count: skills.length, skills });
  } catch (err) {
    next(err);
  }
};

export const createSkill = async (req, res, next) => {
  try {
    const { name, category, description, icon } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Skill name and category are required' });
    }

    const normalizedName = name.trim().toLowerCase();
    let skill = await Skill.findOne({ normalizedName });

    if (skill) {
      return res.status(400).json({ success: false, message: 'Skill already exists' });
    }

    skill = await Skill.create({
      name: name.trim(),
      normalizedName,
      category,
      description: description || '',
      icon: icon || 'BookOpen'
    });

    res.status(201).json({ success: true, skill });
  } catch (err) {
    next(err);
  }
};
