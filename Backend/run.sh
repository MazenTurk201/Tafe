#!/bin/bash
echo "t" | sudo DOTNET_WATCH_RESTART_ON_RUDE_EDIT=true dotnet watch run --project Tafe/Tafe.csproj
