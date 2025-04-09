const expressValidator = require("express-validator");
const { param } = expressValidator;

export const validateUserParams = [
  param("role").custom((value: string) => {
    const allowedRoles = [
      "DRM",
      "ARM",
      "HOD",
      "ED",
      "NETOPS",
      "WEBMASTER",
      "HODHPC",
    ];
    if (!allowedRoles.includes(value.toUpperCase())) {
      throw new Error("Invalid role specified.");
    }
    return true;
  }),

  param("empNo")
    .isString()
    .matches(/^\d+$/)
    .withMessage(
      "Employee number must be a numeric string representing a bigint."
    ),
];

export const validateUserRole = 
  param("role").custom((value: string) => {
    const allowedRoles = [
      "DRM",
      "ARM",
      "HOD",
      "ED",
      "NETOPS",
      "WEBMASTER",
      "HODHPC",
    ];
    if (!allowedRoles.includes(value.toUpperCase())) {
      throw new Error("Invalid role specified.");
    }
    return true;
  });



