# -*- coding: utf-8 -*-
{
    'name': "custom_dashboard",
    'sequence': -1,

    'summary': "Short (1 phrase/line) summary of the module's purpose",

    'description': """
Long description of module's purpose
    """,

    'author': "My Company",
    'website': "https://www.yourcompany.com",


    'category': 'Uncategorized',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends':  ['base', 'web', 'sale', 'board'],


    # always loaded
    'data': [
        # 'security/ir.model.access.csv',
        'views/views.xml',
        'views/sale_dashboard_views.xml',
        'views/templates.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'custom_dashboard/static/src/components/**/*.js',
            'custom_dashboard/static/src/components/**/*.xml',
            'custom_dashboard/static/src/style/styles.css',

        ],
    },
    'installable': True,
    'application': True,
}

