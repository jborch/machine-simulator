import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { StateService } from './state.service';
import { signal } from '@angular/core';

describe('App', () => {
  beforeEach(async () => {
    const mockStateService = {
      state: signal(null),
      connected: signal(false),
      sendCommand: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: StateService, useValue: mockStateService }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
