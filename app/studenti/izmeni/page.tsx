import {ucitajStudentaId,izmeniStudenta} from '@/actions/student';
import { FormWrapper, InputField, HiddenField } from '@/components/form/FormComponents';
import { getLocaleMessages } from '@/i18n/i18n';
import { getLocale } from '@/i18n/locale';
import { extractErrors, getFieldValue } from '@/lib/helpers/url';
import { StudentSearchParams } from '@/lib/types/searchParams';

export default async function IzmjeniGostaPage({ searchParams }: { searchParams: Promise<StudentSearchParams> }) {
    const params = await searchParams;
    const lang = await getLocale();
    const t = await getLocaleMessages(lang, 'student');
    const commonMessages = await getLocaleMessages(lang, 'common');

    const studentId = params.studentId;
    const id = Number(studentId);

    if ((!studentId) || isNaN(id)) {
        return <div>{t.invalid_student_id}</div>;
    }

    const student = await ucitajStudentaId({ studentId: id });
    if (!student) {
        return <div>{t.student_not_found}</div>;
    }

    const errors = extractErrors(params);

    const formData: Record<string, string> = {
       ime: getFieldValue(params?.ime, student.ime),
    };

    return (
        <FormWrapper
            title={`${t.edit} - ID: ${student.id}`}
            action={izmeniStudenta}
            submitLabel={t.edit}
            cancelLabel={t.cancel}
            cancelHref="/studenti"
            description={commonMessages.form_description}
        >
            <HiddenField name="studentId" value={student.id} />
            <InputField
                name="ime"
                label={t.ime}
                placeholder={t.ime}
                required
                defaultValue={formData.ime}
                error={errors.ime}
            />

        </FormWrapper>
    );
}