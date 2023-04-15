import json


async def test_get_example(jp_fetch):
    # When
    response = await jp_fetch("test-server", "get_example")

    # Then
    assert response.code == 200
    payload = json.loads(response.body)
    assert payload == {
        "data": "This is /test-server/get_example endpoint!"
    }