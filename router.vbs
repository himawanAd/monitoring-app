Dim arg
If WScript.Arguments.Count > 0 Then
    arg = LCase(WScript.Arguments(0))
    
    If InStr(arg, "run") > 0 Then
        Set shell = CreateObject("WScript.Shell")
        shell.Run """D:\UNS\Skripsi\monitoring-app\run.vbs"""
        
    ElseIf InStr(arg, "stop") > 0 Then
        Set shell = CreateObject("WScript.Shell")
        shell.Run """D:\UNS\Skripsi\monitoring-app\stop.vbs"""
        
    Else
        MsgBox "Wrong Command: " & arg
    End If
Else
    MsgBox "Wrong Command"
End If
