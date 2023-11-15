import User from "../Models/user.schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createTransport } from "nodemailer";
// import mail from "../Services/nodemail.js";
import dotenv from "dotenv";
dotenv.config();

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const olduser = await User.findOne({ email });
    if (olduser) {
      res.send({ message: "User already exists" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    console.log("hashPassword", hashPassword);

    const newUser = new User({ username, email, password: hashPassword });
    await newUser.save();
    res.status(200).json({ message: "User registered", data: newUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Register failed" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ message: "Inavlid user password" });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    // mail()
    res.status(200).json({ message: "Login success", token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const getuserbyId = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "error in getuser_id" });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    console.log(email);
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(200).json({ message: "User not found" });
    }
    const resetToken = Math.random().toString(36).slice(-8);
    const resetPasswordTokenExpiery = Date.now() + 360000;
    console.log(resetToken);
    await User.updateOne(
      { email: email },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordTokenExpiery: resetPasswordTokenExpiery,
        },
      }
    );
    await user.save();
    const modifieduser = await User.findOne({ email: email });
    console.log(modifieduser);
    const mailTransporter = createTransport({
      service: "gmail",
      auth: {
        user: "nehaveera2001@gmail.com",
        pass: "zzwnhwechrsbobzw",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    const message = {
      from: "nehaveera2001@gmail.com",
      to: email,
      subject: "PASSWORD RESET MAIL",
      text: `reset token->${resetToken}`,
    };
    mailTransporter.sendMail(message, (err) => {
      if (err) {
        console.log("error in sending mail", err);
        return res.status(500).json({ message: "error in reseting password" });
      }
      console.log("mail sent successfully");
      res.status(200).json({ message: "mail sent successfully to emailid" });
    });
  } catch (error) {
    console.log(error);
  }
};

export const resetPasswordpage = async (req, res) => {
    console.log("inside reset function");
    try {
      const token = req.body.token;
      const password = req.body.password;
      console.log("Received token:", token);
  
      if (!token) {
        console.log("Token missing");
        return res.status(400).json({ message: "Token missing" });
      }
  
      const user = await User.findOne({ resetPasswordToken: token });
      console.log("User found:", user);
  
      if (!user) {
        console.log("User not found");
        return res.status(404).json({ message: "User not found" });
      }
  
      const hashPassword = await bcrypt.hash(password, 10);
      console.log("Hashed password:", hashPassword);
  
      const updatedUser = await User.updateOne(
        { resetPasswordToken: token },
        {
          $set: {
            resetPasswordToken: null,
            resetPasswordTokenExpiery: null,
            password: hashPassword,
          },
        }
      );
      console.log("Updated user:", updatedUser);
  
      res.status(200).json({ message: "Password reset successfully" });
      console.log("Password reset success");
    } catch (error) {
      console.error("Error in resetting password:", error);
      res.status(500).json({ message: "Error in resetting password" });
    }
  };
  