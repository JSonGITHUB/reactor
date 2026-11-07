import React, { useState } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Note from '../components/tracker/Note';

describe('Note media attachments', () => {
    beforeEach(() => {
        URL.createObjectURL = jest.fn(() => 'blob:note-test');
        URL.revokeObjectURL = jest.fn();
    });

    test('keeps the add controls available from the collapsed header', () => {
        const initialNotes = [{
            notes: [{
                description: 'Morning session',
                note: 'Sharp wind lines and clean pockets.',
                isCollapsed: false,
                photos: [],
                videos: []
            }]
        }];

        const TestHarness = () => {
            const [notes, setNotes] = useState(initialNotes);
            return (
                <Note
                    notes={notes}
                    setNotes={setNotes}
                    noteGroupIndex={0}
                    noteIndex={0}
                    note={notes[0].notes[0]}
                />
            );
        };

        render(<TestHarness />);

        expect(screen.getByLabelText(/add note photo/i)).toBeTruthy();
        expect(screen.getByLabelText(/add note video/i)).toBeTruthy();
    });

    test('adds an image attachment and renders the preview', () => {
        const initialNotes = [{
            notes: [{
                description: 'Morning session',
                note: 'Sharp wind lines and clean pockets.',
                isCollapsed: false,
                photos: [],
                videos: []
            }]
        }];

        const TestHarness = () => {
            const [notes, setNotes] = useState(initialNotes);
            return (
                <Note
                    notes={notes}
                    setNotes={setNotes}
                    noteGroupIndex={0}
                    noteIndex={0}
                    note={notes[0].notes[0]}
                />
            );
        };

        render(<TestHarness />);

        const file = new File(['image-bytes'], 'sample.png', { type: 'image/png' });

        fireEvent.click(screen.getByText(/photos \(0\)/i));
        const input = screen.getByLabelText(/add note photo/i);

        fireEvent.change(input, { target: { files: [file] } });

        const preview = screen.getByAltText(/sample.png/i);
        expect(preview).toBeTruthy();
        expect(preview.getAttribute('src')).toBe('blob:note-test');
    });

    test('adds a video attachment and exposes a playable source', () => {
        const initialNotes = [{
            notes: [{
                description: 'Morning session',
                note: 'Sharp wind lines and clean pockets.',
                isCollapsed: false,
                photos: [],
                videos: []
            }]
        }];

        const TestHarness = () => {
            const [notes, setNotes] = useState(initialNotes);
            return (
                <Note
                    notes={notes}
                    setNotes={setNotes}
                    noteGroupIndex={0}
                    noteIndex={0}
                    note={notes[0].notes[0]}
                />
            );
        };

        render(<TestHarness />);

        const videoFile = new File(['video-bytes'], 'sample.mp4', { type: 'video/mp4' });

        fireEvent.click(screen.getByText(/videos \(0\)/i));
        const input = screen.getByLabelText(/add note video/i);

        fireEvent.change(input, { target: { files: [videoFile] } });

        const video = document.querySelector('video[src="blob:note-test"]');
        expect(video).toBeTruthy();
        expect(video.getAttribute('src')).toBe('blob:note-test');
    });

    test('keeps the video panel hidden until expanded, then opens the selected video in the larger viewer', () => {
        const initialNotes = [{
            notes: [{
                description: 'Morning session',
                note: 'Sharp wind lines and clean pockets.',
                isCollapsed: false,
                photos: [],
                videos: [{
                    id: 'sample-video',
                    name: 'sample.mp4',
                    size: 1000,
                    type: 'video/mp4',
                    lastModified: 123,
                    url: 'blob:note-test'
                }]
            }]
        }];

        const TestHarness = () => {
            const [notes, setNotes] = useState(initialNotes);
            return (
                <Note
                    notes={notes}
                    setNotes={setNotes}
                    noteGroupIndex={0}
                    noteIndex={0}
                    note={notes[0].notes[0]}
                />
            );
        };

        render(<TestHarness />);

        expect(screen.queryByText(/sample\.mp4 \(1 \/ 1\)/i)).toBeNull();

        fireEvent.click(screen.getByText(/videos \(1\)/i));

        const video = document.querySelector('video[src="blob:note-test"]');
        expect(video).toBeTruthy();

        fireEvent.click(video);
        expect(screen.getByText(/sample\.mp4 \(1 \/ 1\)/i)).toBeTruthy();
    });
});
