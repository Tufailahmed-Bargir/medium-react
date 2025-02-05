import { Hono } from 'hono';
import { usersRouter } from './routes/users';
import { blogRouter } from './routes/blog.ts';

 
const app = new Hono();

app.get('/', (c) => {
	return c.text('signup route')
})

app.route('/users/api/v1', usersRouter)
app.route('/users/api/v1', blogRouter)





export default app;
