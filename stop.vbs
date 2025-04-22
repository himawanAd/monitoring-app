Set objShell = CreateObject("WScript.Shell")
Set objWMIService = GetObject("winmgmts:\\.\root\cimv2")

Set colProcessList = objWMIService.ExecQuery("Select * from Win32_Process where CommandLine like '%monitor.js%'")

For Each objProcess in colProcessList
    objProcess.Terminate
Next

MsgBox "The monitoring system has been successfully closed", vbInformation, "Monitoring System"