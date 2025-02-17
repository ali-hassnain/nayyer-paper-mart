import React from "react";
import Heading from "./Heading";
import Paragraph from "./Paragraph";

const AuthCard = ({
  children,
  heading = `Sign in`,
  description = `Contact admin if you do not have an existing account`,
}) => {
  return (
    <div className="c__auth-card">
      <div className="c__auth-card__wrapper">
        {/*<div className="c__auth-card__branding-wrapper">*/}
        {/*  <span className="b__header__header01__logo u__font-family-heading u__f-900 u__heading-color--primary u__h5 u__letter-spacing--tight">*/}
        {/*    Swoop Parts*/}
        {/*  </span>*/}
        {/*</div>*/}
        <div className="c__auth-card__content-wrapper mb-[2rem]">
          {heading && (
            <Heading tag="h1" className="u__h4 mb-[1rem]">
              {heading}
            </Heading>
          )}
          {description && <Paragraph>{description}</Paragraph>}
        </div>
        <div className="c__auth-card__form-wrapper">{children}</div>
      </div>
    </div>
  );
};

export default AuthCard;
