import { Hono } from "hono" 
export const usersRouter = new Hono()
import { sign } from 'hono/jwt'
import { getPrisma } from "../prismaFunction";
import { SignupSchema,SigninSchema } from "@ahmed_bargir/medium_types_new"; 
import bcrypt from 'bcrypt'
export const userRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string,
		JWT_SECRET: string,
	}
}>();


userRouter.post('/api/v1/signup', async (c) => {
    const prisma = getPrisma(c.env.DATABASE_URL)

	const data = await c.req.json();
    const verifySchema = SignupSchema.safeParse(data)
    if(!verifySchema.success){
        return c.json({
            msg:"provide the valid schema!"
        })
    }

    const {name, email, password} = verifySchema.data
    const hashPassword = await bcrypt.hash(password, 10)
	try {
		const user = await prisma.user.create({
			data: {
                name,
				email,
				password :hashPassword
			}
		});
		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
		return c.json({ jwt });
	} catch(e) {
		c.status(403);
		return c.json({ error: "error while signing up" });
	}
})


userRouter.post('/api/v1/signin', async (c) => {
    const prisma = getPrisma(c.env.DATABASE_URL)

	const data = await c.req.json();
    const verifySchema = SigninSchema.safeParse(data)
    if(!verifySchema.success){
        return c.json({
            msg:"provide the valid schema!"
        })
    }

    const { email, password} = verifySchema.data
    const userExistsCheck = await prisma.user.findUnique({
        where:{
            email
        }
    })
    if(!userExistsCheck){
        return c.json({
            msg:"user not exists create an account first!"
        })
    }
    const verifyPassword = await bcrypt.compare(password, userExistsCheck.password)
    if(!verifyPassword){
        return c.json({
            msg:"password is invalid!"
        })
    }
	 
	 
		const jwt = await sign({ id: userExistsCheck.id }, c.env.JWT_SECRET);
		return c.json({ jwt });
	 
	 
})