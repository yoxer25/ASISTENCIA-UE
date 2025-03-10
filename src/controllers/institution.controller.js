import { Institution } from "../models/institution.model.js";
import { District } from "../models/district.model.js";
import { EducationalLevel } from "../models/educationalLevel.model.js";

export const getData = async (req, res) => {
  const user = req.session;
  try {
    const institutions = await Institution.getInstitution();
    res.render("institution/index", { user, institutions });
  } catch (error) {
    res.render("institution/index", { user });
  }
};

export const getCreate = async (req, res) => {
  const user = req.session;
  try {
    const district = await District.getDistrict();
    const educationalLevel = await EducationalLevel.getEducationalLevel();
    res.render("institution/create", { user, district, educationalLevel });
  } catch (error) {
    res.render("institution/create", { user });
  }
};

export const create = async (req, res) => {
  const {
    modularCode,
    district,
    nameInstitution,
    level,
    nameDirector,
    address,
  } = req.body;
  try {
    const [resModularCodeDB] = await Institution.getInstitutionById(
      modularCode
    );
    if (resModularCodeDB === undefined) {
      const resDb = await Institution.create(
        modularCode,
        district,
        level,
        nameInstitution,
        nameDirector,
        address
      );
      if (resDb.affectedRows > 0) {
        res.redirect("/institutions");
      } else {
        res.redirect("/institutions/create");
        throw new Error("Error al agregar registro");
      }
    } else {
      res.redirect("/institutions/create");
      throw new Error("Registro ya existe");
    }
  } catch (error) {
    res.redirect("/institutions/create");
  }
};
