using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class RejectStation : IMachine
{
    public string Name => "Reject";

    private readonly Conveyor _input;
    private readonly Conveyor _output;
    private readonly RejectBin _rejectBin;
    private readonly ProcessingMachine _machine = new(100, "Inspecting");

    public RejectStation(Conveyor input, Conveyor output, RejectBin rejectBin)
    {
        _input = input;
        _output = output;
        _rejectBin = rejectBin;
    }

    public void Reset() => _machine.Reset();

    public void Tick()
    {
        _machine.Tick();

        if (_machine.HasOutput && _output.Input == null)
        {
            var mover = _machine.Release()!;
            var pen = mover.CurrentItem as Pen;

            if (pen?.InspectionResult == 2)
            {
                ((ICarrier)mover).Unload();
                _rejectBin.AcceptItem(pen);
            }

            _output.Input = mover;
        }

        if (_input.Output != null && _machine.CanReceive)
            _machine.Receive(_input.TakeOutput()!);
    }

    public object GetState() => _machine.GetState();
}
