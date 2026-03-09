import express from "express";
import {
  getUserWorkspaces,
  syncWorkspaces,
} from "../controllers/workspaceController.js";

const workspaceRouter = express.Router();

workspaceRouter.get("/", getUserWorkspaces);
workspaceRouter.post("/sync", syncWorkspaces);

export default workspaceRouter;
