"""
Pytest configuration and global async fixtures
"""

import pytest
from app.database import init_db

@pytest.fixture(autouse=True, scope="session")
def anyio_backend():
    return "asyncio"

@pytest.fixture(autouse=True)
async def setup_test_database():
    await init_db()
