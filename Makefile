dev:
	cd server && make init && make run &
	cd client && pnpm dev
