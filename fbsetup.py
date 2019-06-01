#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import json

PAGE_ACCESS_TOKEN = "EAAfxssAeEOgBAIjIhjnCEZBQAVOc9SsKg2lFjqdI8aEH6sY9ZAapkPGlV2Kb8XeZCKVOCq7P9JgtXw9ZAvMbZC8SjNqGLHYHyuCOohOAsf2lTYCaSmZBDpIXKf8KJbff9VWdIPNN0I0dgUVE1mQUPupvYNVlC8IAev4uNKNZAgWXEtWEPUmYfmR"
URL = 'https://graph.facebook.com/v3.3/me/messenger_profile?access_token=%s' % PAGE_ACCESS_TOKEN


def post(data):
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    return requests.post(URL, data=json.dumps(data), headers=headers)

def get_started():
    return post({"get_started":{"payload":"GREETING"}})

def persistent_menu():
    return post(
        {
        "persistent_menu":[
            {
            "locale":"default",
            "composer_input_disabled":False,
            "call_to_actions":[
                {
                "title":"Группа Крав Мага для начинающих",
                "type":"nested",
                "call_to_actions":[
                    {
                    "title":"Help",
                    "type":"postback",
                    "payload":"HELP_PAYLOAD"
                    },
                    {
                    "title":"Contact Me",
                    "type":"postback",
                    "payload":"CONTACT_INFO_PAYLOAD"
                    }
                ]
                },
                {
                "type":"web_url",
                "title":"Visit website ",
                "url":"http://www.techiediaries.com",
                "webview_height_ratio":"full"
                }
            ]
            },
        ]
        }
    )

r = persistent_menu()


print(r.status_code)
print(r.json())