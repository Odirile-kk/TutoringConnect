import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import './TutorManagement.css';

const emptySubject = { name: '', description: '' };
const emptySlot = { tutor: '', date: '', startTime: '', endTime: '' };
const userId = (value) => String(value?._id || value?.id || value || '');

export default function TutorManagement({ user }) {
  const [tab, setTab] = useState('subjects');
  const [subjects, setSubjects] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [subjectForm, setSubjectForm] = useState(emptySubject);
  const [editingSubject, setEditingSubject] = useState(null);
  const [profileId, setProfileId] = useState('');
  const [bio, setBio] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [slotForm, setSlotForm] = useState(emptySlot);
  const admin = user?.role === 'admin';
  const tutor = user?.role === 'tutor';
  const currentUserId = userId(user);

  const load = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      api('/subjects'),
      api('/tutors'),
      api('/availability'),
    ]);
    const setters = [setSubjects, setTutors, setSlots];
    const names = ['Subjects', 'Tutors', 'Availability'];
    const failures = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        setters[index](Array.isArray(result.value) ? result.value : []);
      } else {
        setters[index]([]);
        failures.push(`${names[index]}: ${result.reason?.message || 'Unable to load'}`);
      }
    });
    setError(failures.join(' | '));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function run(action, successMessage) {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      await action();
      await load();
      setNotice(successMessage);
      return true;
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveSubject(event) {
    event.preventDefault();
    if (!admin) return;
    const name = subjectForm.name.trim();
    if (!name) { setError('Enter a subject name.'); return; }
    const success = await run(
      () => api(editingSubject ? `/subjects/${editingSubject}` : '/subjects', {
        method: editingSubject ? 'PUT' : 'POST',
        body: JSON.stringify({ name, description: subjectForm.description.trim() }),
      }),
      editingSubject ? 'Subject updated.' : 'Subject added.'
    );
    if (success) { setEditingSubject(null); setSubjectForm(emptySubject); }
  }

  function editSubject(subject) {
    setEditingSubject(subject._id);
    setSubjectForm({ name: subject.name, description: subject.description || '' });
  }

  function selectTutor(profile) {
    const id = userId(profile.user);
    if (!admin && id !== currentUserId) return;
    setProfileId(id);
    setBio(profile.bio || '');
    setSelectedSubjects((profile.subjects || []).map(userId));
    setTab('tutors');
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (!profileId || (!admin && profileId !== currentUserId)) return;
    await run(
      () => api(`/tutors/${profileId}/profile`, {
        method: 'PUT',
        body: JSON.stringify({ bio: bio.trim(), subjects: selectedSubjects }),
      }),
      'Tutor profile saved.'
    );
  }

  async function addSlot(event) {
    event.preventDefault();
    if (!(admin || tutor)) return;
    if (!slotForm.date || !slotForm.startTime || !slotForm.endTime) {
      setError('Choose a date, start time and end time.');
      return;
    }
    if (slotForm.startTime >= slotForm.endTime) {
      setError('End time must be after start time.');
      return;
    }
    if (admin && !slotForm.tutor) {
      setError('Select a tutor.');
      return;
    }
    const payload = {
      date: slotForm.date,
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
      ...(admin ? { tutor: slotForm.tutor } : {}),
    };
    const success = await run(
      () => api('/availability', { method: 'POST', body: JSON.stringify(payload) }),
      'Availability added.'
    );
    if (success) setSlotForm(emptySlot);
  }

  return (
    <section className="tutor-management">
      <div className="tutor-management-heading">
        <div>
          <small>TUTORING CONNECT • MANAGEMENT</small>
          <h2>Tutor &amp; Subject Management</h2>
        </div>
        <span>{admin ? 'Administrator' : 'Tutor'}</span>
      </div>

      <div className="tutor-management-tabs">
        <button type="button" className={tab === 'subjects' ? 'active' : ''} onClick={() => setTab('subjects')}>Subjects</button>
        <button type="button" className={tab === 'tutors' ? 'active' : ''} onClick={() => setTab('tutors')}>Tutor Profiles</button>
        <button type="button" className={tab === 'availability' ? 'active' : ''} onClick={() => setTab('availability')}>Availability</button>
        <button type="button" onClick={load} disabled={loading || busy}>Refresh</button>
      </div>

      {error && <p role="alert" className="tutor-management-error">{error}</p>}
      {notice && <p role="status" className="tutor-management-success">{notice}</p>}
      {loading && <p>Loading data...</p>}

      {tab === 'subjects' && (
        <>
          <h3>Subjects</h3>
          {admin && (
            <form onSubmit={saveSubject} className="tutor-management-form">
              <input required placeholder="Subject name" value={subjectForm.name} onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })} />
              <input placeholder="Description" value={subjectForm.description} onChange={e => setSubjectForm({ ...subjectForm, description: e.target.value })} />
              <button disabled={busy} type="submit">{editingSubject ? 'Update' : 'Add'} Subject</button>
              {editingSubject && <button type="button" onClick={() => { setEditingSubject(null); setSubjectForm(emptySubject); }}>Cancel</button>}
            </form>
          )}
          {!loading && subjects.length === 0 && <p>No subjects found. An administrator can add subjects here.</p>}
          <div className="tutor-management-grid">
            {subjects.map(subject => (
              <article key={subject._id}>
                <h4>{subject.name}</h4>
                <p>{subject.description || 'No description'}</p>
                {admin && (
                  <div className="tutor-management-actions">
                    <button type="button" onClick={() => editSubject(subject)}>Edit</button>
                    <button type="button" disabled={busy} onClick={() => {
                      if (window.confirm(`Delete ${subject.name}?`)) {
                        run(() => api(`/subjects/${subject._id}`, { method: 'DELETE' }), 'Subject deleted.');
                      }
                    }}>Delete</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      )}

      {tab === 'tutors' && (
        <>
          <h3>Tutor Profiles</h3>
          {!loading && tutors.length === 0 && <p>No tutor profiles found.</p>}
          <div className="tutor-management-grid">
            {tutors.map(profile => (
              <article key={profile._id}>
                <h4>{profile.user?.name || 'Tutor'}</h4>
                <p>{profile.user?.email || ''}</p>
                <p>{profile.bio || 'No biography'}</p>
                <p>Subjects: {(profile.subjects || []).map(subject => subject.name || '').filter(Boolean).join(', ') || 'None'}</p>
                {(admin || userId(profile.user) === currentUserId) && (
                  <button type="button" onClick={() => selectTutor(profile)}>Manage profile</button>
                )}
              </article>
            ))}
          </div>
          {profileId && (admin || profileId === currentUserId) && (
            <form onSubmit={saveProfile} className="tutor-management-form tutor-management-stack">
              <h4>Edit Tutor Profile</h4>
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tutor biography" />
              <div>
                {subjects.map(subject => (
                  <label key={subject._id}>
                    <input type="checkbox" checked={selectedSubjects.includes(subject._id)} onChange={e => setSelectedSubjects(e.target.checked ? [...selectedSubjects, subject._id] : selectedSubjects.filter(id => id !== subject._id))} />
                    {subject.name}
                  </label>
                ))}
              </div>
              <button type="submit" disabled={busy}>Save Profile</button>
              <button type="button" onClick={() => setProfileId('')}>Cancel</button>
            </form>
          )}
        </>
      )}

      {tab === 'availability' && (
        <>
          <h3>Availability</h3>
          {(admin || tutor) && (
            <form onSubmit={addSlot} className="tutor-management-form">
              {admin && (
                <select required value={slotForm.tutor} onChange={e => setSlotForm({ ...slotForm, tutor: e.target.value })}>
                  <option value="">Select tutor</option>
                  {tutors.map(profile => (
                    <option key={profile._id} value={userId(profile.user)}>{profile.user?.name || 'Tutor'}</option>
                  ))}
                </select>
              )}
              <input type="date" aria-label="Availability date" required value={slotForm.date} onChange={e => setSlotForm({ ...slotForm, date: e.target.value })} />
              <input type="time" aria-label="Start time" required value={slotForm.startTime} onChange={e => setSlotForm({ ...slotForm, startTime: e.target.value })} />
              <input type="time" aria-label="End time" required value={slotForm.endTime} onChange={e => setSlotForm({ ...slotForm, endTime: e.target.value })} />
              <button type="submit" disabled={busy}>Add Time Slot</button>
            </form>
          )}
          {!loading && slots.length === 0 && <p>No availability slots found.</p>}
          <div className="tutor-management-grid">
            {slots.map(slot => (
              <article key={slot._id}>
                <h4>{slot.tutor?.name || 'Tutor'}</h4>
                <p>{slot.date} • {slot.startTime}–{slot.endTime}</p>
                <p>{slot.available ? 'Available' : 'Booked'}</p>
                {slot.available && (admin || userId(slot.tutor) === currentUserId) && (
                  <button type="button" disabled={busy} onClick={() => {
                    if (window.confirm('Delete this slot?')) {
                      run(() => api(`/availability/${slot._id}`, { method: 'DELETE' }), 'Slot deleted.');
                    }
                  }}>Delete</button>
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}