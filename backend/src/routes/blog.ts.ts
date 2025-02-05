import { BlogSchema } from "@ahmed_bargir/medium_types_new"
import { Hono } from "hono"
import { jwt, verify } from "hono/jwt"
import { getPrisma } from "../prismaFunction"
export const blogRouter = new Hono<{
    Bindings:{
        JWT_SECRET:string,
        DATABASE_URL:string
    },
    Variables:{
        userId:string
    }
}>()

blogRouter.use('/*', async (c, next) => {
    const header =  c.req.header('Authorization')||""

    const user = await verify(header, c.env.JWT_SECRET)
    if(user){
          c.set('userId', user.id)
        await next()
        
    }else{
        return c.json({
            msg:"invalid schema"
        })
    }
  })

blogRouter.post('/api/v1/blog',async  (c) => {
const prisma = getPrisma(c.env.DATABASE_URL)
    const data = await c.req.json()

    const verifySchema = BlogSchema.safeParse(data)
    if(!verifySchema.success){
        return c.json({
            msg:"invalid schema"
        })
    }

    const {title, desc} = verifySchema.data
    const authorId = c.get('userId')
    const createBlog = await prisma.post.create({
        data:{
            title,
            content:desc,
            authorId:authorId
        }
    })
	return c.json({
        msg:"blog created success!"
    })
})

// get a single post
blogRouter.get('/api/v1/blog', async(c) => {
    const authorId = c.get('userId')
	 const prisma = getPrisma(c.env.DATABASE_URL)
    const post = await prisma.post.findFirst({
        where:{
            authorId
        }
    })

    return c.json({
        msg:"post fetched success!",
        post
    })
   
})


// get a all the posts
blogRouter.get('/api/v1/blog', async(c) => {
    const authorId = c.get('userId')
	 const prisma = getPrisma(c.env.DATABASE_URL)
    const posts = await prisma.post.findMany()
    return c.json({
        msg:"all blogs fetched success!",
        posts
    })
   
})