using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public interface IStation
{
    string Name { get; }
    string State { get; }
    bool HasOutput { get; }
    bool CanReceive { get; }
    IMover? Send();
    void Receive(IMover mover);
    void Process(ICarrier carrier);
    void Tick();
    StationState GetState();
}
