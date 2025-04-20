Set objShell = CreateObject("WScript.Shell")
Set objWMIService = GetObject("winmgmts:\\.\root\cimv2")

Set colProcessList = objWMIService.ExecQuery("Select * from Win32_Process where CommandLine like '%monitor.js%'")

For Each objProcess in colProcessList
    objProcess.Terminate
Next

objShell.Run "cmd /c start /b D:\UNS\Skripsi\monitoring-app\node.exe D:\UNS\Skripsi\monitoring-app\monitor.js", 0, False
Set objShell = Nothing