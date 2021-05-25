{
    "targets": [
        {
            "target_name": "addon",
            "sources": [
                "./lib/main.cc",
                "./lib/int128.cc",
                "./lib/cgint128.cc"
            ],
            "include_dirs": [
                "<!(node -e \"require('nan')\")"
            ],
        }
    ]
}
