// controllers/authController.ts
import {Request, Response} from "express"

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // allowed roles (optional validation)
    const allowedRoles = ["customer", "admin", "seller"];
    const userRole = allowedRoles.includes(role) ? role : "customer";

    // check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user
    const newUser = await db.insert(users).values({
      name,
      email,
      password_hash: hashedPassword,
      role: userRole,
    }).returning();

    // create token
    const token = jwt.sign({ id: newUser[0].id, role: newUser[0].role }, JWT_SECRET, { expiresIn: "1d" });

    // set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ message: "User registered successfully", user: newUser[0] });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await db.select().from(users).where(eq(users.email, email));
    if (user.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user[0].password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // create token
    const token = jwt.sign({ id: user[0].id, role: user[0].role }, JWT_SECRET, { expiresIn: "1d" });

    // set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", user: user[0] });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};