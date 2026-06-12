
init:
	python3 -m venv .venv
	.venv/bin/python -m pip install -r requirements.txt
	docker compose up -d

run:
	.venv/bin/uvicorn app.main:app --reload

down:
	docker compose down
