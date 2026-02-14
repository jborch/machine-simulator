namespace MachineSimulator.Backend.Models;

public class NestInfeed : IMachine
{
    public string Name => "NestInfeed";

    private int _penCounter;

    public Pen DispensePen()
    {
        _penCounter++;
        return new Pen($"pen-{_penCounter}");
    }

    public void Tick() { }

    public object GetState() => new { PensDispensed = _penCounter };
}
