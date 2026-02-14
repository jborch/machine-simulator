using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class CappingStation : IMachine
{
    public string Name => "Capping";

    private readonly Conveyor _input;
    private readonly Conveyor _output;
    private IMover? _mover;

    public CappingStation(Conveyor input, Conveyor output)
    {
        _input = input;
        _output = output;
    }

    public void Reset() => _mover = null;

    public void Tick()
    {
        if (_mover != null && _output.Input == null)
        {
            _output.Input = _mover;
            _mover = null;
        }

        if (_mover == null && _input.Output != null)
            _mover = _input.TakeOutput();
    }

    public object GetState() => new { Mover = _mover?.GetState() };
}
