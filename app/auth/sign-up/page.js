"use client";
import React, { useState } from "react";
import AuthCard from "@/components/ui/AuthCard";
import Form from "@/components/ui/Form";
import Bounded from "@/components/wrappers/Bounded";
import Container from "@/components/wrappers/Container";
import { SCHEMA__SignupForm } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { createClient } from "@/supabase/client";
import { notFound } from "next/navigation";

const Login = () => {
  return notFound(); // remove this when signup form is needed in future
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    formState: { isValid },
  } = useForm({
    mode: "all",
  });

  const [formMessage, setFormMessage] = useState(null);
  const [payloadPosting, setPayloadPosting] = useState(false);

  const supabase = createClient();

  const onSubmit = async (formData) => {
    setPayloadPosting(true);
    setFormMessage(null);
    formData.username_handle = formData.username_handle.toLowerCase();
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          data: formData,
        },
      });
      if (error) {
        throw new Error(`Authentication failed: ${error.message}`);
      }
      setPayloadPosting(false);
      reset();
      setFormMessage({
        type: `success`,
        message: `Please verify your email address by clicking on the link we sent you on your email address.`,
      });
    } catch (error) {
      console.log(error);
      setPayloadPosting(false);
      setFormMessage({
        type: `error`,
        message: error.message,
      });
    }
  };

  return (
    <>
      <Bounded className="b__auth__variant01 b__size-lg u__background-light">
        <Container>
          <div className="max-w-[500px] mx-auto">
            <AuthCard heading={`Create your account`}>
              <Form
                isValid={isValid}
                formFields={SCHEMA__SignupForm}
                register={register}
                errors={errors}
                control={control}
                buttonTitle={`Continue`}
                onSubmit={handleSubmit(onSubmit)}
                payloadPosting={payloadPosting}
                formMessage={formMessage}
              />
            </AuthCard>
          </div>
        </Container>
      </Bounded>
    </>
  );
};

export default Login;
