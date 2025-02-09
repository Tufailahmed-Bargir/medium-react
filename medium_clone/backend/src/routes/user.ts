import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { SigninSchema, SigninTypes, SignupSchema } from "@ahmed_bargir/medium_types_new";
// import bcrypt from 'bcrypt'
export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();

userRouter.post('/signup', async (c) => {
   try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const body = await c.req.json();
    console.log('dta recived is ', body);
    
  
    const verfySchema = SignupSchema.safeParse(body)
    if(!verfySchema.success){
      c.status(403)
      return c.json({
        msg:"invalid schema!",
       error: verfySchema.error.flatten()
      })
    }
    const {name, email, password} = verfySchema.data
    const userExist = await prisma.user.findUnique({
      where:{
        email
      }
    })

    if (userExist){
      c.status(200)
      return c.json({
        
        msg:"user already exists! login instead!"
      })
    }
    // const hashPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,email,password
      },
    });
  
    const token = await sign({ id: user.id }, c.env.JWT_SECRET)
  
    return c.json({
      success:true,
      jwt: token
    })
   } catch (error) {
    c.status(403)
    return c.json({
      msg:"error found",
      error
    })
   }
})
  
userRouter.post('/signin', async (c) => {
    const prisma = new PrismaClient({
    //@ts-ignore
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const verfySchema = SigninSchema.safeParse(body)
    if(!verfySchema.success){
      c.status(403)
      return c.json({
        msg:"invalid schema!",
       error: verfySchema.error.flatten()
      })
    }

      const {email, password} = verfySchema.data;

      const userExist = await prisma.user.findUnique({
        where:{email}
      })
      if(!userExist){
        return c.json({
          msg:"user not exists create an account first!"
        })
      }

      if(!(password === userExist?.password)){
        return c.json({
          
          msg:"invalid password!, please enter the correct password"
        })
      }
      
    
    

     

    const jwt = await sign({ id: userExist.id }, c.env.JWT_SECRET);
    return c.json({
      success:true,
       jwt });
})

