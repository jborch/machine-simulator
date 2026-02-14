namespace MachineSimulator.Backend.Models;

public interface IMachine
{
    string Name { get; }
    bool CanReceive { get; }
    bool HasOutput { get; }
    void Receive(IMover mover);
    IMover? Send();
    void Tick();
    object GetState();
}
