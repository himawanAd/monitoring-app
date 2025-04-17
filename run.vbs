Set objShell = CreateObject("WScript.Shell")
objShell.Run "node.exe monitor.js", 0, False
Set objShell = Nothing
