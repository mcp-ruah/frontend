// CSS 모듈을 인식하도록 선언
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

// SCSS 모듈을 인식하도록 선언
declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}
