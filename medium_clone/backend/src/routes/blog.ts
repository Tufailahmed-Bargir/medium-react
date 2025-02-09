import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
// import { initMiddleware } from "../middleware";

export const bookRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        userId: string
    }
}>();

bookRouter.use('/*', async (c, next) => {
    try {
        const header = c.req.header("authorization") || "";
        console.log('token is', header);

        if (!header) {
            c.status(401);
            return c.json({ error: "Unauthorized: No token provided" });
        }

        // Extract token (remove 'Bearer ' prefix)
        // const token = header.replace("Bearer ", "").trim();

        // Verify token
        // @ts-ignore
        const response = await verify(header, c.env.JWT_SECRET);

        if (response?.id) {
            // Store userId in context
			// @ts-ignore
            c.set("userId", response.id);

            // Proceed to the next middleware
            await next();
        } else {
            c.status(403);
            return c.json({ error: "Unauthorized" });
        }
    } catch (error: any) {
        c.status(500);
        return c.json({ error: "Internal Server Error", message: error.message });
    }
});



bookRouter.post('/create', async (c) => {
	try {
		const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	console.log('data is ', body);
	
	const post = await prisma.post.create({
		data: {
			title: body.title,
			content: body.content,
			authorId: userId
		}
	});
	console.log('post created suuccess', post);
	
	return c.json({
		id: post.id,
		msg:"blog created succeess!"

	});
	} catch (error) {
		return c.json({
			error
		});
	}
})

bookRouter.put('/', async (c) => {
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	prisma.post.update({
		where: {
			id: body.id,
			authorId: userId
		},
		data: {
			title: body.title,
			content: body.content
		}
	});

	return c.text('updated post');
});

bookRouter.get('/:id', async (c) => {
	const id = c.req.param('id');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	
	const blog = await prisma.post.findUnique({
		where: {
			id:Number(id)
		}
	});

	return c.json({
		blog:blog
	});
})

bookRouter.get('/',async (c) => {
	 
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	
	const post = await prisma.post.findMany({})

	return c.json({
		msg:"hello",
		post
	});
})